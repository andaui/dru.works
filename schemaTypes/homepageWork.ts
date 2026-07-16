import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homepageWork',
  title: 'Homepage Work',
  type: 'document',
  description: 'Choose and order projects for the homepage: 2-col row, main 70% slot, and grid below. Reorder by dragging.',
  fields: [
    defineField({
      name: 'recentProject',
      title: 'Recent — 80% width',
      type: 'reference',
      to: [{ type: 'featuredWork' }],
      description:
        "Project shown at 80% width directly above the 'On the work / team / new ideas / delivery' notes. Uses the project's Homepage cover.",
    }),
    defineField({
      name: 'heroReelVideo',
      title: 'Hero reel video',
      type: 'file',
      options: { accept: 'video/*' },
      description:
        'Currently not shown on the homepage (kept for later use elsewhere).',
    }),
    defineField({
      name: 'homepageSections',
      title: 'Homepage sections',
      type: 'array',
      description:
        'Build the homepage as a stack of sections. For each section pick a Layout, then choose the project(s) to show in it. Drag sections to reorder. When empty, the homepage falls back to the legacy 2-col / main / grid fields below.',
      of: [
        {
          type: 'object',
          name: 'homepageSection',
          title: 'Section',
          fields: [
            {
              name: 'layout',
              title: 'Layout',
              type: 'string',
              validation: (Rule) => Rule.required(),
              initialValue: 'center-70',
              options: {
                layout: 'dropdown',
                list: [
                  { title: 'Full width — 80%, left', value: 'full-80' },
                  { title: 'Two-up — 65% / 35%', value: 'two-up-65-35' },
                  { title: 'Left — 42%', value: 'left-42' },
                  { title: 'Center — 70%', value: 'center-70' },
                  { title: 'Two-up — 20% / 30%', value: 'two-up-20-30' },
                  { title: 'Right — 70%', value: 'right-70' },
                  { title: 'Left — 60%', value: 'left-60' },
                  { title: '3-column row', value: 'grid-3' },
                ],
              },
            },
            {
              name: 'projects',
              title: 'Projects',
              type: 'array',
              of: [{ type: 'reference', to: [{ type: 'featuredWork' }] }],
              description:
                'Single layouts use 1 project. Two-up layouts use 2 (first = large frame, second = small frame). The 3-column row shows up to 3 per row (add more to wrap onto new rows). If a two-up has only 1 project, its first gallery image fills the second frame.',
              validation: (Rule) => Rule.min(1).error('Add at least one project.'),
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description:
                'Optional line shown beneath the image (e.g. "mocks.studio — a project exploring…").',
            },
          ],
          preview: {
            select: {
              layout: 'layout',
              p0: 'projects.0.projectTitle',
              p1: 'projects.1.projectTitle',
              media: 'projects.0.cover.0',
            },
            prepare({ layout, p0, p1, media }) {
              const labels: Record<string, string> = {
                'full-80': 'Full width 80%',
                'two-up-65-35': 'Two-up 65 / 35',
                'left-42': 'Left 42%',
                'center-70': 'Center 70%',
                'two-up-20-30': 'Two-up 20 / 30',
                'right-70': 'Right 70%',
                'left-60': 'Left 60%',
                'grid-3': '3-column row',
              }
              const names = [p0, p1].filter(Boolean).join(' · ')
              return {
                title: labels[layout] || layout || 'Section',
                subtitle: names || 'No projects selected',
                media,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'featuredTwoCol',
      title: 'Featured 2-column row',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'featuredWork' }] }],
      description: 'Two projects shown side by side (50% each). Order = left to right.',
      validation: (Rule) => Rule.max(2),
    }),
    defineField({
      name: 'featuredMain',
      title: 'Featured main (70% width)',
      type: 'reference',
      to: [{ type: 'featuredWork' }],
      description: 'Single project shown at 70% width below the 2-column row.',
    }),
    defineField({
      name: 'gridItems',
      title: 'Grid below',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'featuredWork' }] }],
      description: 'Projects in the grid (first row 2 cols, then 3 per row). Order = drag to reorder.',
    }),
    defineField({
      name: 'belowLogosProject',
      title: 'Project below logos',
      type: 'reference',
      to: [{ type: 'featuredWork' }],
      description: 'Optional project shown at 40% width below the Clients section. Links to the work page.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Homepage Work', subtitle: 'Reel · 2-col · Main · Grid' }
    },
  },
})
