import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'listTitle',
  title: 'List Title',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title || 'List Title',
        subtitle: 'List Title',
      }
    },
  },
})

