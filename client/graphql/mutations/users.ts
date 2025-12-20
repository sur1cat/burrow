import { gql } from "@apollo/client";

export const UPDATE_PROFILE = gql`
    mutation UpdateProfile($input: UpdateProfileInput!) {
        updateProfile(input: $input) {
            id
            username
            email
            bio
            avatar
            role
            createdAt
            updatedAt
        }
    }
`;

export const DELETE_ACCOUNT = gql`
    mutation DeleteAccount {
        deleteAccount {
            success
            message
        }
    }
`;

export const CHANGE_PASSWORD = gql`
    mutation ChangePassword($input: ChangePasswordInput!) {
        changePassword(input: $input)
    }
`;
