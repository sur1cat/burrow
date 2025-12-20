import { GraphQLScalarType, Kind, ValueNode } from 'graphql';

export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',

  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return value;
    }
    throw new Error('DateTime scalar serializer expected a Date object');
  },

  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid DateTime string');
      }
      return date;
    }
    if (typeof value === 'number') {
      return new Date(value);
    }
    throw new Error('DateTime scalar parser expected a string or number');
  },

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid DateTime string');
      }
      return date;
    }
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    throw new Error('DateTime scalar literal expected a string or int');
  },
});

export const scalarResolvers = {
  DateTime: DateTimeScalar,
};
