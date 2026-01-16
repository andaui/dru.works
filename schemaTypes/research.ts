import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'research',
  title: 'Research',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional title for this research item',
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [
        {
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
        },
        {
          type: 'file',
          title: 'Video',
          options: {
            accept: 'video/*',
          },
        },
      ],
      description: 'Add images or videos for research',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Order in which this research item appears (lower numbers appear first)',
      validation: (Rule) => Rule.integer().min(0),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'media',
    },
    prepare({title, media}) {
      const mediaCount = Array.isArray(media) ? media.length : 0
      return {
        title: title || 'Untitled Research',
        subtitle: `${mediaCount} media item${mediaCount !== 1 ? 's' : ''}`,
        media: Array.isArray(media) && media.length > 0 ? media[0] : undefined,
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

