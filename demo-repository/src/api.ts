type Request = { params: { id: string }; user: { organizationId: string } };
declare const db: {
  invoice: { findUnique(args: { where: { id: string } }): Promise<unknown> };
};

export async function getInvoice(request: Request) {
  // Deliberately missing organization scoping for the training demo.
  return db.invoice.findUnique({ where: { id: request.params.id } });
}
