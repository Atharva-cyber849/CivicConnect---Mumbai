"""Type definitions for DRF viewsets"""
from typing import Type, Union, TypeVar
from rest_framework.serializers import Serializer
from django.db.models import QuerySet

T = TypeVar('T')

class ViewSetQuerySet(QuerySet[T]):
    """A queryset that can be used in a viewset"""
    def __class_getitem__(cls, *args):
        return cls

def as_queryset(qs: QuerySet[T]) -> ViewSetQuerySet[T]:
    """Cast a queryset to a ViewSetQuerySet"""
    return qs  # type: ignore