<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import api from '@/api'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSwitch from '@/components/ui/BaseSwitch.vue'
import { useAccountStore } from '@/stores/account'
import { useSettingStore } from '@/stores/setting'

const accountStore = useAccountStore()
const settingStore = useSettingStore()

const { currentAccountId } = storeToRefs(accountStore)
const { settings } = storeToRefs(settingStore)

const saving = ref(false)
const loading = ref(false)
const localNoStealPlants = ref<number[]>([])
const plants = ref<any[]>([])

async function fetchPlants() {
  loading.value = true
  try {
    const { data } = await api.get('/api/game-config/plants')
    if (data && data.ok && data.data) {
      plants.value = data.data
    }
  }
  catch (error) {
    console.error('获取农作物信息失败:', error)
  }
  finally {
    loading.value = false
  }
}

function isNoSteal(plantId: number) {
  return localNoStealPlants.value.includes(plantId)
}

function toggleNoSteal(plantId: number) {
  const index = localNoStealPlants.value.indexOf(plantId)
  if (index > -1) {
    localNoStealPlants.value.splice(index, 1)
  }
  else {
    localNoStealPlants.value.push(plantId)
  }
}

async function saveSettings() {
  if (!currentAccountId.value)
    return

  saving.value = true
  try {
    await settingStore.saveSettings(currentAccountId.value, {
      ...settings.value,
      noStealPlants: localNoStealPlants.value,
    })
  }
  finally {
    saving.value = false
  }
}

async function loadData() {
  if (currentAccountId.value) {
    await settingStore.fetchSettings(currentAccountId.value)
    await fetchPlants()
    localNoStealPlants.value = settings.value.noStealPlants || []
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg text-gray-900 font-medium dark:text-gray-100">
        不偷作物设置
      </h3>
      <BaseButton
        variant="primary"
        size="sm"
        :loading="saving"
        @click="saveSettings"
      >
        保存设置
      </BaseButton>
    </div>

    <div v-if="!currentAccountId" class="flex flex-col items-center justify-center gap-3 rounded-lg bg-gray-50 py-8 text-center text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
      <div class="i-carbon-user-avatar text-3xl opacity-50" />
      <span class="text-sm">请选择账号查看作物列表</span>
    </div>

    <div v-else-if="loading" class="flex flex-col items-center justify-center gap-3 rounded-lg bg-gray-50 py-8 text-center text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
      <div class="i-carbon-plant text-3xl opacity-50" />
      <span class="text-sm">加载农作物数据中...</span>
    </div>

    <div v-else-if="plants.length === 0" class="flex flex-col items-center justify-center gap-3 rounded-lg bg-gray-50 py-8 text-center text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
      <div class="i-carbon-plant text-3xl opacity-50" />
      <span class="text-sm">暂无作物数据</span>
    </div>

    <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-3 sm:grid-cols-2">
      <div
        v-for="plant in plants"
        :key="plant.id"
        class="flex items-center justify-between border rounded-lg p-3 dark:border-gray-700"
      >
        <div class="flex items-center gap-3">
          <img
            v-if="plant.image"
            :src="plant.image"
            :alt="plant.name"
            class="h-10 w-10 rounded object-cover"
          >
          <div v-else class="h-10 w-10 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
            <div class="i-carbon-plant text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <div class="text-gray-900 font-medium dark:text-gray-100">
              {{ plant.name }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              ID: {{ plant.id }} | 等级: {{ plant.level || 0 }}
            </div>
          </div>
        </div>
        <BaseSwitch
          :checked="isNoSteal(plant.id)"
          @change="toggleNoSteal(plant.id)"
        />
      </div>
    </div>
  </div>
</template>
