import {gql} from '@apollo/client';

export const GET_WALK_RECORDS = gql`
  query QGetWalks {
    getWalks {
      ok
      data {
        walkingTime
        startTime
        finishTime
        id
      }
    }
  }
`;

export const GET_WALK_RECORD = gql`
  query QGetWalk($walkId: String!) {
    getWalk(args: {walkId: $walkId}) {
      ok
      error
      data {
        walkRecord
      }
    }
  }
`;

export const DELETE_WALK_RECORD = gql`
  mutation MDeleteWalk($args: DeleteWalkInputDto!) {
    deleteWalk(args: $args) {
      ok
      error
    }
  }
`;

export const CREATE_WALK = gql`
  mutation MCreateWalk($args: CreateWalkInputDto!) {
    createWalk(args: $args) {
      ok
      error
    }
  }
`;
