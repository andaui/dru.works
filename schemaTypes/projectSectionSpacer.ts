import { defineField, defineType } from 'sanity'
import { DragHandleIcon } from '@sanity/icons'

export default defineType({
  name: 'projectSectionSpacer',
  title: 'Section spacer',
  type: 'object',
  icon: DragHandleIcon,
  description: 'Vertical space between sections. Choose height: 24px, 40px, 60px, 80px, or 100px.',
  fields: [
    defineField({
      name: 'height',
      title: 'Spacer height',
      type: 'string',
      options: {
        list: [
          { title: '24px', value: '24' },
          { title: '40px', value: '40' },
          { title: '60px', value: '60' },
          { title: '80px', value: '80' },
          { title: '100px', value: '100' },
        ],
        layout: 'radio',
      },
      initialValue: '24',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { height: 'height' },
    prepare({ height }) {
      return { title: `Spacer ${height || 24}px`, subtitle: 'Section spacer' }
    },
  },
})
