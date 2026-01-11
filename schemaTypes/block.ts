import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'contentBlock',
  title: 'Block',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {type: 'mainTitle'},
        {type: 'textContent'},
        {type: 'price2Col'},
        {type: 'listTitle'},
        {type: 'listItems'},
        {type: 'colLayout'},
        {type: 'link'},
        {type: 'sectionLink'},
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      description: 'Optional background color (e.g., #fbebeb)',
    }),
  ],
  preview: {
    select: {
      content: 'content',
    },
    prepare({content}) {
      return {
        title: `Block (${content?.length || 0} items)`,
        subtitle: 'Block',
      }
    },
  },
})

