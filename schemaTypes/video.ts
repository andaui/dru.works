import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'video',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'videoFile',
      title: 'Video File',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Alternative Text',
      type: 'string',
      description: 'Description of the video for accessibility',
    }),
  ],
  preview: {
    select: {
      title: 'alt',
      media: 'videoFile',
    },
    prepare({title, media}) {
      return {
        title: title || 'Video',
        subtitle: 'Video',
        media: media,
      }
    },
  },
})

