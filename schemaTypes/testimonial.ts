import {defineField, defineType} from 'sanity'
import {RoleAtCompanyPreview} from './components/RoleAtCompanyPreview'

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'testimonialShort',
      title: 'Testimonial Short',
      type: 'text',
      description: 'Short version of the testimonial',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'testimonialLong',
      title: 'Testimonial Long',
      type: 'text',
      description: 'Long version of the testimonial (optional)',
    }),
    defineField({
      name: 'person',
      title: 'Person',
      type: 'string',
      description: 'Name of the person giving the testimonial',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'personPhoto',
      title: 'Person Photo',
      type: 'image',
      description: 'Photo of the person giving the testimonial',
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
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'Job title or role of the person (e.g., "Designer", "CEO", "Product Manager")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      description: 'Company name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'roleAtCompany',
      title: 'Role at Company (Preview)',
      type: 'string',
      description: 'Use this format: "Role at Company" (e.g., "Designer at Company X")',
      readOnly: true,
      components: {
        input: RoleAtCompanyPreview,
      },
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Order in which this testimonial appears (lower numbers appear first)',
      validation: (Rule) => Rule.integer().min(0),
    }),
  ],
  preview: {
    select: {
      person: 'person',
      role: 'role',
      company: 'company',
      testimonial: 'testimonialShort',
      media: 'personPhoto',
    },
    prepare({person, role, company, testimonial, media}) {
      const roleAtCompany = role && company ? `${role} at ${company}` : ''
      return {
        title: person || 'Untitled',
        subtitle: roleAtCompany || testimonial?.substring(0, 50),
        media: media,
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
