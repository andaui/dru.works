import { defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export default defineType({
  name: 'projectSectionWhatIDidOutcomes',
  title: 'What I did & Outcomes',
  type: 'object',
  icon: DocumentTextIcon,
  description: 'Two blocks: "What I did" and "Outcomes", each with a title and text.',
  fields: [
    defineField({
      name: 'whatIDidTitle',
      title: '"What I did" title',
      type: 'string',
      description: 'Heading above the What I did text (e.g. "What I did")',
    }),
    defineField({
      name: 'whatIDidText',
      title: '"What I did" text',
      type: 'text',
      description: 'Body text for What I did',
    }),
    defineField({
      name: 'outcomesTitle',
      title: '"Outcomes" title',
      type: 'string',
      description: 'Heading above the Outcomes text (e.g. "Outcomes")',
    }),
    defineField({
      name: 'outcomesText',
      title: '"Outcomes" text',
      type: 'text',
      description: 'Body text for Outcomes',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'What I did & Outcomes', subtitle: 'Title + text for each block' }
    },
  },
})
