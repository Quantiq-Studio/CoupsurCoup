import { Client, Account, Databases, Avatars } from 'appwrite';

export const client = new Client();
client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68308c5900097b30072d');

export const account = new Account(client);
export const databases = new Databases(client);
export const avatars = new Avatars(client);