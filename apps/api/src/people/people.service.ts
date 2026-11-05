import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ErrorCode, Page, PersonView } from '@smallweb/shared';
import { AppError } from '../common/errors/app-error';
import { Person, PersonDocument } from './person.schema';

// Turns a stored person into the public shape: `id` as a string, never `_id`.
export function toPersonView(person: PersonDocument): PersonView {
  return { id: person._id.toString(), name: person.name };
}

@Injectable()
export class PeopleService {
  constructor(@InjectModel(Person.name) private readonly personModel: Model<Person>) {}

  // Few people, so no pagination; still wrapped in a Page so the shape matches other lists.
  async list(): Promise<Page<PersonView>> {
    const people = await this.personModel.find().sort({ name: 1 });
    return { items: people.map(toPersonView), nextCursor: null };
  }

  // Used by publishing and visits. A malformed id can't belong to anyone, so it is also "not found".
  async getById(personId: string): Promise<PersonDocument> {
    const person = Types.ObjectId.isValid(personId)
      ? await this.personModel.findById(personId)
      : null;
    if (!person) {
      throw new AppError(ErrorCode.PERSON_NOT_FOUND, HttpStatus.NOT_FOUND, 'No such person');
    }
    return person;
  }
}
