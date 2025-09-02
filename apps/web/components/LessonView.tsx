'use client';
import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@repo/backend/convex';
import { useParams, useRouter } from 'next/navigation';
import { Id } from '@repo/backend/dataModel';
import { VideoPlayer } from './VideoPlayer';

export function LessonView() {
  const { lessonId } = useParams<{ lessonId: Id<'lessons'> }>();
  const router = useRouter();
  const lesson = useQuery(api.courses.getLesson, {
    lessonId,
  });
  const completeLesson = useMutation(api.courses.completeLesson);

  const [startTime] = useState(Date.now());
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  if (!lessonId) {
    return <div>Lesson ID not found</div>;
  }

  if (lesson === undefined) {
    return (
      <div className='flex justify-center items-center min-h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (lesson === null) {
    return (
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Lesson Not Found
          </h1>
          <button
            onClick={() => router.push('/courses')}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const handleCompleteLesson = async (score?: number) => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60); // minutes

    try {
      await completeLesson({
        lessonId: lessonId,
        score,
        timeSpent: Math.max(1, timeSpent), // At least 1 minute
      });

      toast.success('Lesson completed! 🎉');
      router.push(`/courses/${lesson.course._id}`);
    } catch {
      toast.error('Failed to complete lesson');
    }
  };

  const handleQuizSubmit = () => {
    if (!lesson.quiz) return;

    let correct = 0;
    lesson.quiz.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / lesson.quiz.questions.length) * 100);
    setQuizScore(score);
    setShowResults(true);

    if (score >= lesson.quiz.passingScore) {
      handleCompleteLesson(score);
    }
  };

  const renderQuiz = () => {
    if (!lesson.quiz) return null;

    return (
      <div className='space-y-6'>
        {lesson.quiz.questions.map((question, questionIndex) => (
          <div key={questionIndex} className='bg-gray-50 rounded-lg p-6'>
            <h3 className='font-medium text-gray-900 mb-4'>
              {questionIndex + 1}. {question.question}
            </h3>

            <div className='space-y-2'>
              {question.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    showResults
                      ? optionIndex === question.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : quizAnswers[questionIndex] === optionIndex &&
                            optionIndex !== question.correctAnswer
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-white'
                      : quizAnswers[questionIndex] === optionIndex
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type='radio'
                    name={`question-${questionIndex}`}
                    value={optionIndex}
                    checked={quizAnswers[questionIndex] === optionIndex}
                    onChange={() => {
                      if (!showResults) {
                        const newAnswers = [...quizAnswers];
                        newAnswers[questionIndex] = optionIndex;
                        setQuizAnswers(newAnswers);
                      }
                    }}
                    disabled={showResults}
                    className='mr-3'
                  />
                  <span className='text-gray-900'>{option}</span>
                </label>
              ))}
            </div>

            {showResults && (
              <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}
          </div>
        ))}

        {!showResults ? (
          <button
            onClick={handleQuizSubmit}
            disabled={quizAnswers.length !== lesson.quiz.questions.length}
            className='w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Submit Quiz
          </button>
        ) : (
          <div className='text-center p-6 bg-white rounded-lg border'>
            <div className='text-4xl mb-4'>
              {quizScore >= lesson.quiz.passingScore ? '🎉' : '😔'}
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              Quiz{' '}
              {quizScore >= lesson.quiz.passingScore ? 'Passed!' : 'Failed'}
            </h3>
            <p className='text-gray-600 mb-4'>
              Your score: {quizScore}% (Passing: {lesson.quiz.passingScore}%)
            </p>
            {quizScore < lesson.quiz.passingScore ? (
              <button
                onClick={() => {
                  setQuizAnswers([]);
                  setShowResults(false);
                  setQuizScore(0);
                }}
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Try Again
              </button>
            ) : (
              <button
                onClick={() => {
                  void router.push(`/courses/${lesson.course._id}`);
                }}
                className='bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors'
              >
                Continue to Next Lesson
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Header */}
      <div className='mb-8'>
        <button
          onClick={() => {
            void router.push(`/courses/${lesson.course._id}`);
          }}
          className='flex items-center text-blue-600 hover:text-blue-700 mb-4 text-sm'
        >
          <span className='mr-1'>←</span>
          Back to {lesson.course.title}
        </button>

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center space-x-3'>
              <div className='text-2xl'>
                {lesson.type === 'video'
                  ? '🎥'
                  : lesson.type === 'quiz'
                    ? '❓'
                    : '📖'}
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  {lesson.title}
                </h1>
                <p className='text-gray-600'>
                  {lesson.type} • {lesson.duration} minutes
                </p>
              </div>
            </div>

            {lesson.completed && (
              <div className='flex items-center space-x-2 text-green-600'>
                <span className='text-xl'>✅</span>
                <span className='font-medium'>Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-8'>
        {lesson.type === 'quiz' ? (
          renderQuiz()
        ) : (
          <>
            {lesson.type === 'video' &&
            (lesson.muxPlaybackId || lesson.videoUrl) ? (
              <div className='mt-8'>
                {lesson.muxPlaybackId ? (
                  <VideoPlayer
                    lessonId={lessonId}
                    className='w-full h-96'
                    onTimeUpdate={(currentTime) => {
                      // Track video progress if needed
                      console.log('Video time:', currentTime);
                    }}
                    onEnded={() => {
                      // Auto-complete lesson when video ends
                      if (!lesson.completed) {
                        handleCompleteLesson();
                      }
                    }}
                  />
                ) : lesson.videoUrl ? (
                  <video
                    controls
                    className='w-full rounded-lg'
                    src={lesson.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            ) : (
              <div className='prose max-w-none text-gray-800 leading-relaxed'>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lesson.content || ''}
                </ReactMarkdown>
              </div>
            )}

            {!lesson.completed && (
              <div className='mt-8 pt-6 border-t border-gray-200'>
                <button
                  onClick={() => handleCompleteLesson()}
                  className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium'
                >
                  Mark as Complete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
