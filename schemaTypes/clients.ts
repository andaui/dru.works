import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'clients',
  title: 'Clients',
  type: 'object',
  fields: [
    defineField({
      name: 'logos',
      title: 'Client Logos',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'logo',
              title: 'Logo',
              type: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alternative Text',
                  description: 'Important for accessibility',
                },
              ],
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'companyName',
              title: 'Company Name',
              type: 'string',
              description: 'Optional: Company name for reference',
            },
          ],
          preview: {
            select: {
              title: 'companyName',
              media: 'logo',
            },
            prepare({title, media}) {
              return {
                title: title || 'Client Logo',
                media: media,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      logos: 'logos',
    },
    prepare({logos}) {
      return {
        title: `Clients (${logos?.length || 0} logos)`,
        subtitle: 'Clients',
      }
    },
  },
})

