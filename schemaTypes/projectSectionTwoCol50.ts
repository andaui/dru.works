import { defineField, defineType } from 'sanity'
import { ThLargeIcon } from '@sanity/icons'

export default defineType({
  name: 'projectSectionTwoCol50',
  title: '2 columns 50% each',
  type: 'object',
  icon: ThLargeIcon,
  description: 'Two equal columns; each can have an image or video (auto height). Empty column keeps 50% gap.',
  fields: [
    defineField({
      name: 'leftMedia',
      title: 'Left column (50%)',
      type: 'projectMedia',
      description: 'Optional. If empty, left stays as 50% gap.',
    }),
    defineField({
      name: 'rightMedia',
      title: 'Right column (50%)',
      type: 'projectMedia',
      description: 'Optional. If empty, right stays as 50% gap.',
    }),
  ],
  preview: {
    prepare() {
      return { title: '2 columns 50% each', subtitle: 'Image or video per column' }
    },
  },
})
