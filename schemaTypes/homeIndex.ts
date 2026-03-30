import {defineField, defineType} from 'sanity'

/** Singleton: home hero “Index” tab — title, client/services columns, contact button. */
export default defineType({
  name: 'homeIndex',
  title: 'Index',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Index title',
      type: 'text',
      rows: 3,
      description:
        'Main heading when Index is selected (e.g. line break between lines). If empty, the Work page Hero title is used.',
    }),
    defineField({
      name: 'clientColumns',
      title: 'Client list (columns)',
      type: 'array',
      description: 'Each item is one column, top to bottom. Order columns left to right.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'items',
              title: 'Names',
              type: 'array',
              of: [{type: 'string'}],
            }),
          ],
          preview: {
            select: {items: 'items'},
            prepare({items}: {items?: string[]}) {
              const n = items?.length ?? 0
              return {title: n ? `Column (${n})` : 'Empty column'}
            },
          },
        },
      ],
    }),
    defineField({
      name: 'servicesColumns',
      title: 'Services list (columns)',
      type: 'array',
      description: 'Each column is shown below the contact button.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'items',
              title: 'Items',
              type: 'array',
              of: [{type: 'string'}],
            }),
          ],
          preview: {
            select: {items: 'items'},
            prepare({items}: {items?: string[]}) {
              const n = items?.length ?? 0
              return {title: n ? `Column (${n})` : 'Empty column'}
            },
          },
        },
      ],
    }),
    defineField({
      name: 'contactButtonText',
      title: 'Button text',
      type: 'string',
      description: 'Label for the mail button between the client and services lists.',
      initialValue: 'Contact',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Index', subtitle: 'Home hero'}
    },
  },
})
