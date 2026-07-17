import api from './api';

export async function getCharacters(page = 1, limit = 12) {
  const response = await api.get('/characters', { params: { page, limit } });
  return response.data;
}

export async function searchCharactersByName(name) {
  const response = await api.get('/characters', { params: { name } });
  return response.data;
}
