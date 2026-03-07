import { defineField, defineType } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export default defineType({
  name: 'projectSectionOneCol',
  title: '1 column (100%, 70%, or 40%)',
  type: 'object',
  icon: ImageIcon,
  description: 'Single column with optional image or video. Width: 100%, 70%, or 40%. Auto height.',
  fields: [
    defineField({
      name: 'width',
      title: 'Column width',
      type: 'string',
      options: {
        list: [
          { title: '100%', value: '100' },
          { title: '70%', value: '70' },
          { title: '40%', value: '40' },
        ],
        layout: 'radio',
      },
      initialValue: '100',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'media',
      title: 'Image or video',
      type: 'projectMedia',
      description: 'Optional. If empty, section still reserves the width.',
    }),
  ],
  preview: {
    select: { width: 'width' },
    prepare({ width }) {
      return { title: `1 column ${width || '100'}%`, subtitle: 'Image or video' }
    },
  },
})
