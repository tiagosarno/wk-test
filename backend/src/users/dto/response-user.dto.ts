class ITask {
  id: number;
  name: string;
  createdAt?: Date;
  description: string;
  completed: boolean;
  userId: number;
}
export class ResponseFindOneUserDto {
  id: number;
  name: string;
  email: string;
  Task: ITask[];
}
export class ResponseCreateUserDto {
  id: number;
  name: string;
  email: string;
}
