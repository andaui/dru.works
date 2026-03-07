import { defineField, defineType } from 'sanity'
import { BlockContentIcon } from '@sanity/icons'

export default defineType({
  name: 'projectSectionText',
  title: 'Text section',
  type: 'object',
  icon: BlockContentIcon,
  description: 'Text with max-width 860px. Styled like homepage hero (40px, 47px line-height, -0.25px letter-spacing).',
  fields: [
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { text: 'text' },
    prepare({ text }) {
      return {
        title: text?.substring(0, 50) || 'Text section',
        subtitle: 'Max-width 860px',
      }
    },
  },
})
