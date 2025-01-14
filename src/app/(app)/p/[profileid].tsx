import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { useProfile } from '@/api/generated/public-hooks';
import { Image, Text, View } from '@/components/ui';

export default function ProfileScreen() {
  const params = useLocalSearchParams();
  console.log('🚀  params:', params);
  const profileId = params['profileid'];

  const {
    data: profile,
    isError,
    isPending,
  } = useProfile({
    variables: {
      id: profileId as string,
    },
  });

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error loading profile</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Image
        className="h-56 w-full overflow-hidden rounded-xl"
        contentFit="cover"
        source={{
          uri: profile.photoUrl ?? undefined,
        }}
      />
      <View className="mt-4">
        <Text className="text-2xl font-bold">{profile.displayName}</Text>
        <Text className="text-gray-600">@{profile.username}</Text>
      </View>
    </View>
  );
}
