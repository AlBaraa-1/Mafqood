/**
 * Mafqood Mobile - API Client
 * Mirrors frontend/src/api/lostFoundApi.ts with React Native adaptations
 */

import { API_BASE_URL, ENDPOINTS } from './config';
import {
  SubmitItemPayload,
  LostItemResponse,
  FoundItemResponse,
  HistoryResponse,
} from '../types/itemTypes';

/**
 * Normalize image URL from backend and build full URL.
 * Handles Windows backslashes and prepends base URL.
 */
export function buildImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // Convert backslashes to forward slashes (Windows paths)
  const normalized = imageUrl.replace(/\\/g, '/');
  
  // If already a full URL, return as-is
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }
  
  // Ensure path starts with /
  const path = normalized.startsWith('/') ? normalized : `/${normalized}`;
  
  // Prepend base URL
  return `${API_BASE_URL}${path}`;
}

/**
 * Build FormData for submitting an item (React Native version)
 */
function buildFormData(payload: SubmitItemPayload): FormData {
  const formData = new FormData();
  
  // Append image file (React Native format)
  formData.append('file', {
    uri: payload.file.uri,
    name: payload.file.name,
    type: payload.file.type,
  } as any);
  
  formData.append('title', payload.title);
  
  if (payload.description) {
    formData.append('description', payload.description);
  }
  
  formData.append('location_type', payload.locationType);
  
  if (payload.locationDetail) {
    formData.append('location_detail', payload.locationDetail);
  }
  
  formData.append('time_frame', payload.timeFrame);
  
  return formData;
}

/**
 * Submit a lost item report and get AI-suggested matches.
 */
export async function submitLostItem(payload: SubmitItemPayload): Promise<LostItemResponse> {
  const formData = buildFormData(payload);
  
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOST}`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to submit lost item: ${response.status} - ${errorText}`);
  }
  
  const data: LostItemResponse = await response.json();
  return data;
}

/**
 * Submit a found item report and get AI-suggested matches.
 */
export async function submitFoundItem(payload: SubmitItemPayload): Promise<FoundItemResponse> {
  const formData = buildFormData(payload);
  
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.FOUND}`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to submit found item: ${response.status} - ${errorText}`);
  }
  
  const data: FoundItemResponse = await response.json();
  return data;
}

/**
 * Fetch user's activity history with all lost and found items and their matches.
 */
export async function fetchHistory(): Promise<HistoryResponse> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.HISTORY}`);
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch history: ${response.status} - ${errorText}`);
  }
  
  const data: HistoryResponse = await response.json();
  return data;
}

/**
 * Reset/clear the entire database (admin function for testing).
 */
export async function resetDatabase(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.RESET}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to reset database: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ status: string; version: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.HEALTH}`);
  
  if (!response.ok) {
    throw new Error('Backend is not reachable');
  }
  
  return response.json();
}
