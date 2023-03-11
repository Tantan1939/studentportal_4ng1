from rest_framework.response import Response
from .models import note
from .serializers import NoteSerializer

# many = True  serialize multiple objects
# many = False  serialize single object


def getNotesList(request):
    notes = note.objects.all().order_by('-updated')
    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)


def getNoteDetail(request, pk):
    notes = note.objects.get(id=pk)
    serializer = NoteSerializer(notes, many=False)
    return Response(serializer.data)


def createNote(request):
    data = request.data
    note = note.objects.create(
        body=data['body']
    )
    serializer = NoteSerializer(note, many=False)
    return Response(serializer.data)


def updateNote(request, pk):
    data = request.data
    note = note.objects.get(id=pk)
    serializer = NoteSerializer(instance=note, data=data)

    if serializer.is_valid():
        serializer.save()

    return serializer.data


def deleteNote(request, pk):
    note = note.objects.get(id=pk)
    note.delete()
    return Response('Note was deleted!')
