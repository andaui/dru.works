import { defineField, defineType } from 'sanity'
import { SplitVerticalIcon } from '@sanity/icons'

export default defineType({
  name: 'projectSectionTwoCol30',
  title: '2 columns (30/70, 35/65, or 40/60)',
  type: 'object',
  icon: SplitVerticalIcon,
  description: 'Narrow and wide columns. Choose ratio (30/70, 35/65, or 40/60) and which side is narrow. Each column can have image or video (auto height).',
  fields: [
    defineField({
      name: 'ratio',
      title: 'Column ratio',
      type: 'string',
      options: {
        list: [
          { title: '30% / 70%', value: '30-70' },
          { title: '35% / 65%', value: '35-65' },
          { title: '40% / 60%', value: '40-60' },
        ],
        layout: 'radio',
      },
      initialValue: '30-70',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'narrowSide',
      title: 'Narrow column on',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'leftMedia',
      title: 'Left column',
      type: 'projectMedia',
      description: 'Optional. Left column content.',
    }),
    defineField({
      name: 'rightMedia',
      title: 'Right column',
      type: 'projectMedia',
      description: 'Optional. Right column content.',
    }),
  ],
  preview: {
    select: { ratio: 'ratio', narrowSide: 'narrowSide' },
    prepare({ ratio, narrowSide }) {
      const label = ratio === '40-60' ? '40/60' : ratio === '35-65' ? '35/65' : '30/70'
      return {
        title: `2 columns ${label}`,
        subtitle: narrowSide === 'right' ? 'Narrow right' : 'Narrow left',
      }
    },
  },
})
