enum INVOICE {
  CREATE = 'invoice.create',
  GET_BY_ID = 'invoice.get_by_id',
  UPDATE_BY_ID = 'invoice.update_by_id',
  DELETE_BY_ID = 'invoice.delete_by_id',
  SEND = 'invoice.send',
  UPDATE_INVOICE_PAID = 'invoice.update_invoice_paid',
}

enum PRODUCT {
  CREATE = 'product.create',
  GET_LIST = 'product.get_list',
}

enum USER {
  CREATE = 'user.create',
  GET_ALL = 'user.get_all',
  GET_BY_USER_ID = 'user.get_by_user_id',
}

enum ROLE {
  CREATE = 'role.create',
  GET_ALL = 'role.get_all',
  GET_ALL_CURSOR = 'role.get_all_cursor',
  GET_BY_ID = 'role.get_by_id',
  UPDATE = 'role.update',
  DELETE = 'role.delete',
  CHANGE_STATUS = 'role.change_status',
  SET_PERMISSIONS = 'role.set_permissions',
}

enum KEYCLOAK {
  CREATE_USER = 'keycloak.create_user',
}

enum AUTHORIZER {
  LOGIN = 'authorizer.login',
  VERIFY_USER_TOKEN = 'authorizer.verify_user_token',
}

enum PDF_GENERATOR {
  CREATE_INVOICE_PDF = 'pdf_generator.create_invoice_pdf',
}

enum MEDIA {
  UPLOAD_FILE = 'media.upload_file',
}

export const TCP_REQUEST_MESSAGE = {
  USER,
  ROLE,
  INVOICE,
  PRODUCT,
  KEYCLOAK,
  AUTHORIZER,
  PDF_GENERATOR,
  MEDIA,
};
