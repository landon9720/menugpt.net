import { setPrompt } from '@/lib/data'

export default async function handler(req, res) {
  await setPrompt('1', {
    prompt: 'ancient rome',
    body: 'Ancient Rome was a kingdom, then a republic, then an empire, and then history.',
    children: [
      {
        id: '2',
        prompt: 'Julius Caesar',
      },
    ],
  })
  await setPrompt('2', {
    prompt: 'Julius Caesar',
  })
  res.status(200).end()
}
