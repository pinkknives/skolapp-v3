import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Mock handlers for API requests in component tests
export const handlers = [
  // Mock quiz creation API
  rest.post('/api/quizzes', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'mock-quiz-1',
        title: 'Test Quiz',
        status: 'draft',
        createdAt: new Date().toISOString()
      })
    )
  }),

  // Mock AI generation API  
  rest.post('/api/ai/generate-questions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        questions: [
          {
            id: 'q1',
            title: 'Vad är huvudstaden i Sverige?',
            type: 'multiple-choice',
            options: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala'],
            correctAnswer: 0
          }
        ]
      })
    )
  }),

  // Mock organizations API
  rest.get('/api/organizations', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'org-1',
          name: 'Test Skola',
          role: 'teacher'
        }
      ])
    )
  })
]

// Create server instance for tests
export const server = setupServer(...handlers)