import {defineField, defineType} from 'sanity'

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
      description: 'Order in which this work appears (lower numbers appear first)',
      validation: (Rule) => Rule.integer().min(0),
    }),
  ],
  preview: {
    select: {
      title: 'projectTitle',
      subtitle: 'projectDescriptionShort',
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

