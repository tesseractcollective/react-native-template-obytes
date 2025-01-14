import { FlashList } from '@shopify/flash-list';
import { Link } from 'expo-router';
import React from 'react';

import { type ProfilesQuery, useProfiles } from '@/api/generated/public-hooks';
import {
  EmptyList,
  FocusAwareStatusBar,
  Image,
  Pressable,
  Text,
  View,
} from '@/components/ui';

export default function Feed() {
  const { data, isError, isPending } = useProfiles({
    variables: {
      limit: 20,
    },
  });

  const renderItem = React.useCallback(
    ({ item }: { item: ProfilesQuery['profiles'][0] }) => (
      <Link href={`/p/${item.id}`} asChild>
        <Pressable>
          <View className="m-2 overflow-hidden rounded-xl border border-neutral-300 bg-white dark:bg-neutral-900">
            <Image
              className="h-56 w-full overflow-hidden rounded-t-xl"
              contentFit="cover"
              source={{
                uri: item.photoUrl,
              }}
            />

            <View className="p-2">
              <Text className="py-3 text-2xl ">{item.displayName}</Text>
              <Text numberOfLines={3} className="leading-snug text-gray-600">
                {item.username}
              </Text>
            </View>
          </View>
        </Pressable>
      </Link>
    ),
    []
  );

  if (isError) {
    return (
      <View>
        <Text> Error Loading data </Text>
      </View>
    );
  }
  return (
    <View className="flex-1 ">
      <FocusAwareStatusBar />
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => `item-${index}`}
        ListEmptyComponent={<EmptyList isLoading={isPending} />}
        estimatedItemSize={300}
      />
    </View>
  );
}
