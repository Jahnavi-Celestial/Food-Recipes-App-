import { gql } from '@apollo/client';

export const LOAD_RECIPES = gql`
    query{
        recipes{
            id
            title 
            description
        }
    }
`;