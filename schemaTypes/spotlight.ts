import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'spotlight',
  title: 'Spotlight',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Text that appears below the image/video',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'media',
      title: 'Image/Video',
      type: 'object',
      fields: [
        {
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
        },
        {
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
        },
        {
          name: 'video',
          title: 'Video File',
          type: 'file',
          options: {
            accept: 'video/*',
          },
          hidden: ({parent}) => parent?.type !== 'video',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Order in which this spotlight item appears (lower numbers appear first)',
      validation: (Rule) => Rule.integer().min(0),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      mediaType: 'media.type',
      image: 'media.image',
      video: 'media.video',
    },
    prepare({title, mediaType, image, video}) {
      return {
        title: title || 'Untitled Spotlight',
        subtitle: mediaType === 'video' ? 'Video' : 'Image',
        media: image || video,
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

