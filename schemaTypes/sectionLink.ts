import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'sectionLink',
  title: 'Section Link',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Link Text',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Optional URL for the link',
    }),
  ],
  preview: {
    select: {
      text: 'text',
      url: 'url',
    },
    prepare({text, url}) {
      return {
        title: text || 'Section Link',
        subtitle: url || 'No URL',
      }
    },
  },
})

