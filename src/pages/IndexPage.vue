<template>
  <q-page class="q-pa-md">
    <q-input
      v-model="searchTerm"
      outlined
      dense
      clearable
      placeholder="Buscar personaje..."
      class="q-mb-md"
      style="max-width: 400px"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="characters.length === 0" class="flex flex-center q-pa-xl text-grey">
      No se encontraron personajes
    </div>

    <q-infinite-scroll v-else ref="infiniteScrollRef" :offset="250" @load="onLoad">
      <div class="row q-col-gutter-md">
        <div
          v-for="character in characters"
          :key="character.id"
          class="col-xs-6 col-sm-4 col-md-3"
        >
          <q-card>
            <q-img :src="character.image" height="280px" fit="contain" class="bg-grey-2" />
            <q-card-section>
              <div class="text-subtitle1">{{ character.name }}</div>
              <div class="text-caption text-grey">{{ character.race }}</div>
              <div class="text-caption text-grey">{{ character.affiliation }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-infinite-scroll>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getCharacters, searchCharactersByName } from '../services/characters';

const characters = ref([]);
const loading = ref(false);
const searchTerm = ref('');
const page = ref(1);
const totalPages = ref(1);
const hasMore = ref(true);
const infiniteScrollRef = ref(null);

let debounceTimer = null;

async function loadCharacters() {
  loading.value = true;
  try {
    const data = await getCharacters(1, 12);
    characters.value = data.items ?? [];
    totalPages.value = data.meta?.totalPages ?? 1;
    page.value = 1;
    hasMore.value = page.value < totalPages.value;
  } finally {
    loading.value = false;
  }
}

async function searchCharacters(name) {
  loading.value = true;
  try {
    characters.value = await searchCharactersByName(name);
  } finally {
    loading.value = false;
  }
}

async function onLoad(index, done) {
  const term = searchTerm.value.trim();

  if (term !== '') {
    done();
    return;
  }

  if (!hasMore.value) {
    done(true);
    return;
  }

  page.value += 1;
  const data = await getCharacters(page.value, 12);
  characters.value = characters.value.concat(data.items ?? []);
  totalPages.value = data.meta?.totalPages ?? totalPages.value;
  hasMore.value = page.value < totalPages.value;
  done(!hasMore.value);
}

onMounted(() => {
  loadCharacters();
});

watch(searchTerm, (value) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const term = (value ?? '').trim();
    if (term === '') {
      page.value = 1;
      hasMore.value = true;
      await loadCharacters();
      infiniteScrollRef.value?.reset();
      infiniteScrollRef.value?.resume();
    } else {
      await searchCharacters(term);
      infiniteScrollRef.value?.reset();
      infiniteScrollRef.value?.stop();
    }
  }, 400);
});
</script>
