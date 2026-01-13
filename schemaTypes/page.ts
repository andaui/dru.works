import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      description: 'Title displayed in the hero section of the page',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Description',
      type: 'text',
      description: 'Description text displayed in the hero section of the page',
    }),
    defineField({
      name: 'sections',
      title: 'Sections & Testimonials',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'section'}, {type: 'testimonial'}],
          options: {
            disableNew: false,
          },
        },
      ],
      validation: (Rule) => Rule.unique(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    prepare({title, slug}) {
      return {
        title: title || 'Untitled Page',
        subtitle: slug ? `/${slug}` : '',
      }
    },
  },
})

