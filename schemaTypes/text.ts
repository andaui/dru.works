import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'textContent',
  title: 'Text',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      text: 'text',
    },
    prepare({text}) {
      return {
        title: text?.substring(0, 50) || 'Text',
        subtitle: 'Text',
      }
    },
  },
})

