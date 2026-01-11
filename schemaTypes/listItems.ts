import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'listItems',
  title: 'List Items',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'showBullets',
      title: 'Show Bullets',
      type: 'boolean',
      description: 'Toggle to show/hide dot.svg bullets',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      items: 'items',
      showBullets: 'showBullets',
    },
    prepare({items, showBullets}) {
      return {
        title: `List Items (${items?.length || 0} items)`,
        subtitle: showBullets ? 'With bullets' : 'Without bullets',
      }
    },
  },
})

