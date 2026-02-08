
import { z } from 'zod';
import { 
  insertUserSchema, 
  insertDocumentRequestSchema, 
  insertPaymentSchema,
  insertPetitionSchema,
  insertMajorApplicationSchema,
  insertCalendarEventSchema,
  users,
  documentRequests,
  payments,
  gradeChangePetitions,
  majorApplications,
  calendarEvents
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  users: {
    me: {
      method: 'GET' as const,
      path: '/api/users/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/users/me' as const,
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  },
  documentRequests: {
    list: {
      method: 'GET' as const,
      path: '/api/document-requests' as const,
      responses: {
        200: z.array(z.custom<typeof documentRequests.$inferSelect & { payment?: typeof payments.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/document-requests' as const,
      input: insertDocumentRequestSchema,
      responses: {
        201: z.custom<typeof documentRequests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/document-requests/:id' as const,
      responses: {
        200: z.custom<typeof documentRequests.$inferSelect & { payment?: typeof payments.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  payments: {
    process: {
      method: 'POST' as const,
      path: '/api/payments' as const,
      input: z.object({
        requestId: z.number(),
        amount: z.number(),
        method: z.enum(["online", "voucher"])
      }),
      responses: {
        200: z.custom<typeof payments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  petitions: {
    list: {
      method: 'GET' as const,
      path: '/api/petitions' as const,
      responses: {
        200: z.array(z.custom<typeof gradeChangePetitions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/petitions' as const,
      input: insertPetitionSchema,
      responses: {
        201: z.custom<typeof gradeChangePetitions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/petitions/:id/status' as const,
      input: z.object({
        status: z.enum(["approved_dept", "approved_dean", "approved_registrar", "rejected"])
      }),
      responses: {
        200: z.custom<typeof gradeChangePetitions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  majorApplications: {
    list: {
      method: 'GET' as const,
      path: '/api/major-applications' as const,
      responses: {
        200: z.array(z.custom<typeof majorApplications.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/major-applications' as const,
      input: insertMajorApplicationSchema,
      responses: {
        201: z.custom<typeof majorApplications.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  calendar: {
    list: {
      method: 'GET' as const,
      path: '/api/calendar' as const,
      responses: {
        200: z.array(z.custom<typeof calendarEvents.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/calendar' as const,
      input: insertCalendarEventSchema,
      responses: {
        201: z.custom<typeof calendarEvents.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
