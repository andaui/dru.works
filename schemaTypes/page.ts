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
      type: 'text',
      description: 'Title displayed in the hero section of the page. Use line breaks to split into multiple lines.',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero description (legacy)',
      type: 'text',
      hidden: true,
      description: 'Migrated to Homepage description. Data is still read until you copy it over.',
    }),
    defineField({
      name: 'homepageDescription',
      title: 'Homepage description',
      type: 'text',
      description:
        'Work page: intro in the home hero right column. About / Services pages: paragraphs shown in the home hero left column when that nav item is selected (also used on standalone page routes where applicable).',
    }),
    defineField({
      name: 'sections',
      title: 'Sections, Testimonials & Featured Work',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'section'}, {type: 'testimonial'}, {type: 'featuredWork'}],
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

