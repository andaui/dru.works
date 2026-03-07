import { defineField, defineType } from 'sanity'

/** Single image or video slot for project detail sections. Optional per column. */
export default defineType({
  name: 'projectMedia',
  title: 'Project Media',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
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
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alternative Text' },
      ],
      hidden: ({ parent }) => parent?.type !== 'image',
    }),
    defineField({
      name: 'video',
      title: 'Video File',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.type !== 'video',
    }),
  ],
  preview: {
    select: { type: 'type' },
    prepare({ type }) {
      return { title: type === 'video' ? 'Video' : 'Image', subtitle: 'Project media' }
    },
  },
})
