import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'section',
  title: 'Section',
  type: 'document',
  fields: [
    defineField({
      name: 'sectionTitle',
      title: 'Section Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'blocks',
      title: 'Blocks',
      type: 'array',
      of: [{type: 'contentBlock'}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Media',
      type: 'object',
      fields: [
        defineField({
          name: 'type',
          title: 'Media Type',
          type: 'string',
          options: {
            list: [
              {title: 'Image', value: 'image'},
              {title: 'Video', value: 'video'},
            ],
            layout: 'radio',
          },
          initialValue: 'image',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              description: 'Important for accessibility and SEO',
            },
          ],
          hidden: ({parent}) => parent?.type !== 'image',
        }),
        defineField({
          name: 'video',
          title: 'Video File',
          type: 'file',
          options: {
            accept: 'video/*',
          },
          hidden: ({parent}) => parent?.type !== 'video',
        }),
        defineField({
          name: 'text',
          title: 'Text',
          type: 'text',
          description: 'Optional text to display below the media',
        }),
      ],
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Order in which this section appears (lower numbers appear first)',
      validation: (Rule) => Rule.integer().min(0),
    }),
  ],
  preview: {
    select: {
      title: 'sectionTitle',
      blocks: 'blocks',
    },
    prepare({title, blocks}) {
      return {
        title: title || 'Untitled Section',
        subtitle: `${blocks?.length || 0} block(s)`,
      }
    },
  },
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
})

