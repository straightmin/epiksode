"use client";

import React, { useState, useCallback } from "react";
import { useThemeContext } from "../../../../frontend-theme-system/components/ThemeProvider";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GripVertical, X, Plus, Save } from "lucide-react";

interface SeriesPhoto {
    id: string;
    imageUrl: string;
    title: string;
    order: number;
}

export default function CreateSeriesPage() {
    const { theme, isDark } = useThemeContext();
    const [seriesTitle, setSeriesTitle] = useState("");
    const [seriesDescription, setSeriesDescription] = useState("");
    const [photos, setPhotos] = useState<SeriesPhoto[]>([
        {
            id: "1",
            imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
            title: "산속의 아침",
            order: 0,
        },
        {
            id: "2",
            imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
            title: "도시의 야경",
            order: 1,
        },
        {
            id: "3",
            imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
            title: "숲속의 오솔길",
            order: 2,
        },
    ]);

    const handleDragEnd = useCallback((result: { destination?: { index: number }, source: { index: number } }) => {
        if (!result.destination) return;

        const items = Array.from(photos);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // 순서 업데이트
        const updatedPhotos = items.map((photo, index) => ({
            ...photo,
            order: index,
        }));

        setPhotos(updatedPhotos);
    }, [photos]);

    const removePhoto = useCallback((photoId: string) => {
        setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    }, []);

    const saveSeries = useCallback(() => {
        const seriesData = {
            title: seriesTitle,
            description: seriesDescription,
            photos: photos.map(photo => ({
                id: photo.id,
                order: photo.order,
            })),
        };

        console.log('Saving series:', seriesData);
        alert('시리즈가 성공적으로 생성되었습니다!');
    }, [seriesTitle, seriesDescription, photos]);

    return (
        <div 
            className="min-h-screen p-4 lg:p-8"
            style={{
                backgroundColor: isDark
                    ? theme.theme.colors.background.dark
                    : theme.theme.colors.background.main,
            }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 
                        className="text-3xl font-display font-bold mb-2"
                        style={{
                            color: isDark
                                ? theme.theme.colors.primary.white
                                : theme.theme.colors.primary.black,
                        }}
                    >
                        시리즈 만들기
                    </h1>
                    <p
                        className="text-sm"
                        style={{
                            color: isDark
                                ? theme.theme.colors.primary.gray
                                : theme.theme.colors.primary.darkGray,
                        }}
                    >
                        연관된 사진들을 하나의 스토리로 만들어보세요
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Series Info */}
                    <div className="space-y-4">
                        <div>
                            <label 
                                className="block text-sm font-medium mb-2"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.white
                                        : theme.theme.colors.primary.black,
                                }}
                            >
                                시리즈 제목
                            </label>
                            <input
                                type="text"
                                value={seriesTitle}
                                onChange={(e) => setSeriesTitle(e.target.value)}
                                placeholder="시리즈 제목을 입력하세요"
                                className="w-full px-4 py-3 rounded-lg border"
                                style={{
                                    backgroundColor: isDark
                                        ? theme.theme.colors.background.dark
                                        : theme.theme.colors.background.main,
                                    borderColor: isDark
                                        ? theme.theme.colors.primary.darkGray
                                        : theme.theme.colors.primary.purpleVeryLight,
                                    color: isDark
                                        ? theme.theme.colors.primary.white
                                        : theme.theme.colors.primary.black,
                                }}
                            />
                        </div>

                        <div>
                            <label 
                                className="block text-sm font-medium mb-2"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.white
                                        : theme.theme.colors.primary.black,
                                }}
                            >
                                설명
                            </label>
                            <textarea
                                value={seriesDescription}
                                onChange={(e) => setSeriesDescription(e.target.value)}
                                placeholder="시리즈에 대한 설명을 적어주세요"
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border resize-none"
                                style={{
                                    backgroundColor: isDark
                                        ? theme.theme.colors.background.dark
                                        : theme.theme.colors.background.main,
                                    borderColor: isDark
                                        ? theme.theme.colors.primary.darkGray
                                        : theme.theme.colors.primary.purpleVeryLight,
                                    color: isDark
                                        ? theme.theme.colors.primary.white
                                        : theme.theme.colors.primary.black,
                                }}
                            />
                        </div>

                        <button
                            onClick={saveSeries}
                            disabled={!seriesTitle.trim() || photos.length === 0}
                            className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: theme.theme.colors.primary.purple,
                                color: theme.theme.colors.primary.white,
                            }}
                        >
                            <Save size={20} />
                            시리즈 저장하기
                        </button>
                    </div>

                    {/* Photo Ordering */}
                    <div>
                        <h3 
                            className="text-lg font-bold mb-4"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                            }}
                        >
                            드래그해서 순서 변경
                        </h3>

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="photos">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-3"
                                    >
                                        {photos.map((photo, index) => (
                                            <Draggable
                                                key={photo.id}
                                                draggableId={photo.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`
                                                            flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
                                                            ${snapshot.isDragging ? 'scale-105 shadow-lg' : ''}
                                                        `}
                                                        style={{
                                                            backgroundColor: isDark
                                                                ? theme.theme.colors.background.dark
                                                                : theme.theme.colors.background.main,
                                                            borderColor: snapshot.isDragging
                                                                ? theme.theme.colors.primary.purple
                                                                : isDark
                                                                ? theme.theme.colors.primary.darkGray
                                                                : theme.theme.colors.primary.purpleVeryLight,
                                                            ...provided.draggableProps.style,
                                                        }}
                                                    >
                                                        {/* Drag Handle */}
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="cursor-grab active:cursor-grabbing"
                                                            style={{
                                                                color: isDark
                                                                    ? theme.theme.colors.primary.gray
                                                                    : theme.theme.colors.primary.darkGray,
                                                            }}
                                                        >
                                                            <GripVertical size={20} />
                                                        </div>

                                                        {/* Order Number */}
                                                        <div
                                                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                                            style={{
                                                                backgroundColor: theme.theme.colors.primary.purple,
                                                                color: theme.theme.colors.primary.white,
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </div>

                                                        {/* Photo Preview */}
                                                        <img
                                                            src={photo.imageUrl}
                                                            alt={photo.title}
                                                            className="w-16 h-12 object-cover rounded"
                                                        />

                                                        {/* Photo Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p
                                                                className="font-medium truncate"
                                                                style={{
                                                                    color: isDark
                                                                        ? theme.theme.colors.primary.white
                                                                        : theme.theme.colors.primary.black,
                                                                }}
                                                            >
                                                                {photo.title}
                                                            </p>
                                                        </div>

                                                        {/* Remove Button */}
                                                        <button
                                                            onClick={() => removePhoto(photo.id)}
                                                            className="p-1 rounded transition-colors hover:bg-red-100"
                                                            style={{
                                                                color: theme.theme.colors.accent.pink,
                                                            }}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        {/* Add More Photos */}
                        <button
                            className="w-full mt-4 py-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors hover:border-opacity-100"
                            style={{
                                borderColor: theme.theme.colors.primary.purple,
                                color: theme.theme.colors.primary.purple,
                                borderOpacity: 0.5,
                            }}
                        >
                            <Plus size={20} />
                            사진 추가하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}