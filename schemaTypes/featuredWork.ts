import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'featuredWork',
  title: 'Featured Work',
  type: 'document',
  fields: [
    defineField({
      name: 'projectTitle',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'projectTitle' },
      description: 'URL for the project details page (e.g. /work/my-project). Add to enable project detail page and links from homepage.',
    }),
    defineField({
      name: 'projectDescriptionShort',
      title: 'Project Description Short',
      type: 'text',
      description: 'Short description that will always be displayed',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'projectDescriptionLong',
      title: 'Project Description Long',
      type: 'text',
      description: 'Long description - if populated, "Read more" link will appear',
    }),
    defineField({
      name: 'teamContribution',
      title: 'Team Contribution',
      type: 'string',
      description: 'Optional text to show team contribution (e.g., "Team contribution")',
    }),
    defineField({
      name: 'creative',
      title: 'Creative',
      type: 'text',
      description: 'Shown on the homepage below the project title (e.g. creative role or credit).',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      description: 'Project year. Shown above the first line on the project detail page (left side).',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      description: 'Client name. Shown above the first line on the project detail page (right side).',
    }),
    defineField({
      name: 'cover',
      title: 'Homepage cover',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alternative Text' },
          ],
        },
        {
          type: 'file',
          title: 'Video',
          options: { accept: 'video/*' },
        },
      ],
      validation: (Rule) => Rule.max(1),
      description: 'Optional image or video used on the homepage. If empty, the first item from Images/Videos is used.',
    }),
    defineField({
      name: 'images',
      title: 'Images/Videos',
      type: 'array',
      of: [
        {
          type: 'image',
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
        },
        {
          type: 'file',
          title: 'Video',
          options: {
            accept: 'video/*',
          },
        },
      ],
      description: 'Add images or videos for this project',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Used only when homepage work is not set via "Homepage Work". Lower numbers appear first in the grid.',
      validation: (Rule) => Rule.integer().min(0),
    }),
    defineField({
      name: 'sections',
      title: 'Project detail sections',
      type: 'array',
      of: [
        defineArrayMember({ type: 'projectSectionTwoCol50' }),
        defineArrayMember({ type: 'projectSectionTwoCol30' }),
        defineArrayMember({ type: 'projectSectionOneCol' }),
        defineArrayMember({ type: 'projectSectionText' }),
        defineArrayMember({ type: 'projectSectionWhatIDidOutcomes' }),
        defineArrayMember({ type: 'projectSectionTestimonial' }),
      ],
      description: 'Sections for the project details page. 24px spacing between sections.',
    }),
  ],
  preview: {
    select: {
      title: 'projectTitle',
      subtitle: 'projectDescriptionShort',
      slug: 'slug.current',
    },
    prepare({ title, subtitle, slug }) {
      return { title, subtitle: slug ? `/${slug}` : subtitle }
    },
  },
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})

