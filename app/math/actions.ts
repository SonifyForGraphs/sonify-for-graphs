import * as z from 'zod';

export const FormSchema = z.object({
  function: z.string().min(1, {
    message: 'Function must be at least 1 character.',
  }),
  title: z.string().min(1, {
    message: "Title must be at least 1 character"
  }),
  y_label: z.string().min(1, {
    message: 'y-axis label must be at least 1 character'
  }),
  x_label: z.string().min(1, {
    message: 'x-axis label must be at least 1 character'
  }),
  graph_color: z.string()
});