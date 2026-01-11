import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'price2Col',
  title: 'Price 2 Column',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Price Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'price',
              title: 'Price',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              label: 'label',
              price: 'price',
            },
            prepare({label, price}) {
              return {
                title: `${label}: ${price}`,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      items: 'items',
    },
    prepare({items}) {
      return {
        title: `Price 2 Column (${items?.length || 0} items)`,
        subtitle: 'Price 2 Column',
      }
    },
  },
})

