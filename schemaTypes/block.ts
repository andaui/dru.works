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
        {type: 'clients'},
        {type: 'video'},
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      description: 'Optional background color (e.g., #fbebeb)',
    }),
    defineField({
      name: 'maxWidth780',
      title: 'Max Width 780px',
      type: 'boolean',
      description: 'Toggle to set max width to 780px (default: 600px)',
      initialValue: false,
    }),
    defineField({
      name: 'maxWidth980',
      title: 'Max Width 980px (for clients)',
      type: 'boolean',
      description: 'Toggle to set max width to 980px for clients component',
      initialValue: false,
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

