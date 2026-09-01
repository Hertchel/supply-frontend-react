export type UsersType = {
  id?: string,
  employee_id: string,
  first_name: string,
  last_name: string,
  email: string,
  designation: string,
  role: string,
  is_active: string,
  date_joined: Date,
  last_login: Date,
  is_reviewer?: boolean,
}