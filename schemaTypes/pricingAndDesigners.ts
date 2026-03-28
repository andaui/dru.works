import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'pricingAndDesigners',
  title: 'Pricing & designers',
  type: 'document',
  description:
    'Homepage pricing calculator: amounts, Dru portrait (both left stripes), and optional photos for additional designers (team row: Dru first, then these in order).',
  fields: [
    defineField({
      name: 'baseMonthlyLead',
      title: 'Base monthly (lead / Dru)',
      type: 'number',
      description: 'Monthly rate shown beside “Monthly rate” and “Lead Designer (Dru)”.',
      initialValue: 20_000,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'rateAdditional1',
      title: 'Per additional designer (1 additional on team)',
      type: 'number',
      initialValue: 13_500,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'rateAdditional2',
      title: 'Per additional designer (2 additional on team)',
      type: 'number',
      initialValue: 13_000,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'rateAdditional3Plus',
      title: 'Per additional designer (3+ additional on team)',
      type: 'number',
      initialValue: 12_500,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'maxTeamSize',
      title: 'Maximum team size (counter)',
      type: 'number',
      description: 'Upper limit for the team size control (minimum 1).',
      initialValue: 8,
      validation: (Rule) => Rule.required().min(1).max(50),
    }),
    defineField({
      name: 'druPortrait',
      title: 'Dru portrait',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'additionalDesignerPhotos',
      title: 'Additional designer photos',
      type: 'array',
      description:
        'Shown in the second left stripe after Dru (same portrait again). Order = left to right. No fixed limit.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'designerPhoto',
          fields: [
            defineField({
              name: 'photo',
              title: 'Photo',
              type: 'image',
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { media: 'photo' },
            prepare({ media }) {
              return { title: 'Designer photo', media }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'moreInfoTitle',
      title: 'More info title',
      type: 'string',
      description:
        'Shown below “Monthly total” / volume note in the team pricing breakdown (same layout as that row). Leave empty to hide the block.',
    }),
    defineField({
      name: 'moreInfoDescription',
      title: 'More info description',
      type: 'text',
      rows: 4,
      description: 'Secondary line under the more info title (muted). Supports line breaks.',
    }),
    defineField({
      name: 'howIWorkTitle',
      title: 'How I work title',
      type: 'string',
      description:
        'Label on the expandable row under the monthly amount (e.g. “How I work”). Shown collapsed; click expands the description below.',
      initialValue: 'How I work',
    }),
    defineField({
      name: 'howIWorkDescription',
      title: 'How I work description',
      type: 'text',
      rows: 6,
      description: 'Revealed when the title row is expanded. Line breaks preserved.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Pricing & designers' }
    },
  },
})
