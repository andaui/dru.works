import { defineField, defineType } from 'sanity'
import { CommentIcon } from '@sanity/icons'

export default defineType({
  name: 'projectSectionTestimonial',
  title: 'Testimonial',
  type: 'object',
  icon: CommentIcon,
  description: 'A testimonial block. Choose an existing testimonial; it will display like on other pages.',
  fields: [
    defineField({
      name: 'testimonial',
      title: 'Testimonial',
      type: 'reference',
      to: [{ type: 'testimonial' }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Testimonial', subtitle: 'Reference to a testimonial' }
    },
  },
})
