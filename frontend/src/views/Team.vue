<script setup lang="ts">
import Logo from '@/components/ui/Logo.vue'
import { useAuthUser } from '@/router/auth/AuthUserProvider'
import { Label } from '@/components/ui/label'
import Button from '@/components/ui/Button.vue'
import { Archive, ChevronDown, Home, PanelLeft, Plus, Search, Upload } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import {
  TableHeader,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useRoute, useRouter } from 'vue-router'
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type {
  StatusError,
  Team,
  TeamProject,
  TeamProjectsResponse,
  TeamResponse,
} from '@/lib/types'
import { StatusCodes } from 'http-status-codes'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ref } from 'vue'

const { user } = useAuthUser()
const router = useRouter()
const route = useRoute()

const {
  data: teamProjects,
  isLoading: teamProjectsIsLoading,
  error: teamProjectsError,
  status: teamProjectsStatus,
} = useQuery<TeamProjectsResponse>({
  queryKey: ['teamProjects', route.params.team],
  queryFn: async () => {
    const response = await fetch(`http://localhost:8080/api/v1/teams/${route.params.team}/projects`)
    if (!response.ok) {
      if (response.status === StatusCodes.UNAUTHORIZED) {
        router.push('/auth/login')
      }
      throw new Error((await response.json()).message)
    }
    return response.json() as Promise<TeamProjectsResponse>
  },
})

const { data: team } = useQuery<TeamResponse>({
  queryKey: ['team', route.params.team],
  queryFn: async () => {
    const response = await fetch(`http://localhost:8080/api/v1/teams?slug=${route.params.team}`, {
      credentials: 'include',
    })
    if (!response.ok) {
      router.push('/-/')
      throw new Error((await response.json()).message)
    }
    return response.json() as Promise<TeamResponse>
  },
})

const projectName = ref('')
const queryClient = useQueryClient()

const createProject = useMutation({
  mutationKey: ['createProject'],
  mutationFn: async (projectName: string) => {
    const response = await fetch(
      `http://localhost:8080/api/v1/teams/${route.params.team}/projects`,
      {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          projectName,
        }),
      },
    )
    if (!response.ok) {
      throw new Error((await response.json()).message)
    }
    return response.json()
  },
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: ['teamProjects'] })
  },
})
</script>

<template>
  <DashboardLayout>
    <header class="h-[72px] py-4 px-6 flex justify-between items-center">
      <div class="flex gap-4 font-medium items-center">
        <div class="flex gap-2 items-center cursor-pointer">
          {{ team && team.team.name }}
          <ChevronDown class="size-4 stroke-neutral-600" />
        </div>
      </div>
      <div class="flex items-center gap-4">
        <Dialog>
          <DialogTrigger :as-child="true">
            <Button size="sm"><Plus class="size-4" /> New Project </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle> New Project </DialogTitle>
            </DialogHeader>
            <form class="grid gap-4" @submit.prevent="() => createProject.mutate(projectName)">
              <Input v-model="projectName" placeholder="Name" />
              <DialogFooter>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </header>
    <div class="p-4">
      <Table class="rounded-t-lg overflow-clip">
        <TableHeader>
          <TableRow>
            <TableHead> Name </TableHead>
            <TableHead> Created </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-if="teamProjects"
            v-for="teamProject in teamProjects.teamProjects"
            @click="() => router.push(`/-/${route.params.team}/${teamProject.slug}`)"
            class="cursor-pointer hover:underline"
          >
            <TableCell>{{ teamProject.name }}</TableCell>
            <TableCell>{{ new Date(teamProject.createdAt).toDateString() }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </DashboardLayout>
</template>
